#!/usr/bin/env python3
"""Build the pinned W02 prototype without an author's private Maven volume."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import urllib.request

HERE = Path(__file__).resolve().parent
LOCK = json.loads((HERE / "sources.lock.json").read_text())
CACHE = Path(os.environ.get("DEMO_CACHE", str(Path.home() / ".cache/agent-hub-alpha/issue16"))).resolve()


def run(args, **kwargs):
    return subprocess.run([str(x) for x in args], check=True, **kwargs)


def prepare():
    for name, source in LOCK["sources"].items():
        dest = CACHE / "sources" / name
        if not (dest / ".git").exists():
            dest.mkdir(parents=True, exist_ok=True)
            run(["git", "init", "-q", dest])
            run(["git", "-C", dest, "remote", "add", "origin", source["url"]])
        status = run(["git", "-C", dest, "status", "--porcelain"], capture_output=True, text=True).stdout
        if status.strip():
            raise RuntimeError(f"Refusing to change modified source cache: {dest}")
        current = subprocess.run(["git", "-C", str(dest), "rev-parse", "HEAD"], capture_output=True, text=True)
        if current.stdout.strip() != source["commit"]:
            run(["git", "-C", dest, "fetch", "--depth", "1", "origin", source["commit"]])
            run(["git", "-C", dest, "checkout", "--detach", source["commit"]])
        print(f"{name}: {source['commit']}", flush=True)
    tools = CACHE / "tools"
    tools.mkdir(parents=True, exist_ok=True)
    archive = tools / "go.tar.gz"
    if not archive.exists() or hashlib.sha256(archive.read_bytes()).hexdigest() != LOCK["go"]["sha256"]:
        temporary = archive.with_suffix(".partial")
        print("Downloading Go toolchain", flush=True)
        with urllib.request.urlopen(LOCK["go"]["url"], timeout=90) as source, temporary.open("wb") as target:
            shutil.copyfileobj(source, target)
        if hashlib.sha256(temporary.read_bytes()).hexdigest() != LOCK["go"]["sha256"]:
            temporary.unlink()
            raise RuntimeError("Go archive checksum mismatch")
        temporary.replace(archive)
    uv = shutil.which("uv")
    if not uv:
        raise RuntimeError(f"Install uv {LOCK['workswarm_uv']} before building WorkSwarm")
    version = run([uv, "--version"], capture_output=True, text=True).stdout.split()[1]
    if version != LOCK["workswarm_uv"]:
        raise RuntimeError(f"Expected uv {LOCK['workswarm_uv']}; found {version}")
    shutil.copy2(uv, tools / "uv")
    print(f"Source and toolchain cache ready: {CACHE}", flush=True)


def compose(*args, capture=False):
    env = os.environ.copy()
    env["DEMO_CACHE"] = str(CACHE)
    env["COMPOSE_PARALLEL_LIMIT"] = "1"
    secret = Path(env.get("AHA_SECRETS_FILE", str(Path.home() / ".config/aha-swarm/secrets.env")))
    # Prefer explicit SWARM_* configuration or a supplied file. Reuse the
    # existing DeepSeek environment only when neither has been configured.
    model_keys = ("SWARM_API_BASE", "SWARM_API_KEY", "SWARM_MODEL_NAME")
    if not secret.is_file() and not any(env.get(key, "").strip() for key in model_keys):
        if env.get("DEEPSEEK_API_KEY", "").strip():
            env["SWARM_API_KEY"] = env["DEEPSEEK_API_KEY"]
            env["SWARM_API_BASE"] = env.get("COEVOSKILLS_DEEPSEEK_BASE_URL") or env.get("DEEPSEEK_BASE_URL") or "https://api.deepseek.com"
            env["SWARM_MODEL_NAME"] = env.get("COEVOSKILLS_DEEPSEEK_MODEL") or env.get("DEEPSEEK_MODEL", "")
            env.setdefault("SWARM_ENDPOINT_PROFILE", "deepseek")
    dotenv = ["--env-file", secret] if secret.is_file() else []
    return run(["docker", "compose", *dotenv, "--profile", "ui", "-f", HERE / "compose.yaml", *args],
               env=env, capture_output=capture, text=True)


def model_preflight():
    # Compose resolves both environment variables and optional dotenv files.
    # Never print the resolved configuration: it contains credentials.
    config = json.loads(compose("config", "--format", "json", capture=True).stdout)
    for service in ("swarm", "orchestrator"):
        env = config["services"][service]["environment"]
        missing = [key for key in ("SWARM_API_BASE", "SWARM_API_KEY", "SWARM_MODEL_NAME")
                   if not str(env.get(key) or "").strip()]
        if missing:
            raise RuntimeError(f"{service} model configuration keys missing: " + ", ".join(missing))


def build(which):
    prepare()
    compose("config", "--quiet")
    selected = {"go": ["credit"], "java": ["orchestrator"], "ui": ["swarm"],
                "all": ["credit", "orchestrator", "swarm"]}[which]
    for service in selected:
        compose("--progress", "plain", "build", service)
    manifest = {"sources": LOCK, "images": {}, "base_images": {}}
    names = {"credit": "agent-hub-issue16/credit:46980e8-local",
             "orchestrator": "agent-hub-issue16/orchestrator:46980e8-local",
             "swarm": "agent-hub-issue16/workswarm:1142e5fb3-local"}
    for service in selected:
        data = json.loads(run(["docker", "image", "inspect", names[service]], capture_output=True, text=True).stdout)[0]
        manifest["images"][service] = {"tag": names[service], "id": data["Id"], "created": data["Created"]}
    for name in ["python:3.11-slim", "node:22-slim", "nginx:alpine"]:
        result = subprocess.run(["docker", "image", "inspect", name], capture_output=True, text=True)
        if result.returncode == 0:
            data = json.loads(result.stdout)[0]
            manifest["base_images"][name] = {"id": data["Id"], "digests": data.get("RepoDigests", [])}
    evidence = CACHE / "evidence"
    evidence.mkdir(parents=True, exist_ok=True)
    (evidence / f"build-{which}.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["prepare", "build", "start", "check", "status", "stop"])
    parser.add_argument("component", nargs="?", default="all", choices=["all", "go", "java", "ui", "core"])
    args = parser.parse_args()
    if args.command == "prepare":
        prepare()
    elif args.command == "build":
        if args.component == "core":
            build("go")
            build("java")
        else:
            build(args.component)
    elif args.command == "start":
        if args.component == "core":
            compose("up", "-d", "--no-build", "--wait", "credit", "orchestrator")
        else:
            model_preflight()
            compose("up", "-d", "--no-build", "--wait")
    elif args.command == "check":
        compose("config", "--quiet")
        print("Compose configuration valid. This does not validate model calls or #16 acceptance.")
    elif args.command == "status":
        compose("ps")
    else:
        compose("down")  # Retains named volumes and affects this project only.


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError, OSError) as exc:
        print(f"Demo operation failed: {exc}", file=sys.stderr)
        sys.exit(1)
