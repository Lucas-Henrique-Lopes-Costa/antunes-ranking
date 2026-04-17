#!/bin/bash
# SSH tunnel: localhost:5433 -> VPS:5433 (Postgres do swarm antunes-ranking)
# Deixe esse terminal aberto enquanto roda `npm run dev` em outro.

set -e

VPS_HOST="root@72.62.140.243"
LOCAL_PORT="5433"
REMOTE_PORT="5433"

echo "Abrindo SSH tunnel $LOCAL_PORT <- $VPS_HOST:$REMOTE_PORT"
echo "Ctrl+C pra fechar."
exec ssh -N -L ${LOCAL_PORT}:localhost:${REMOTE_PORT} ${VPS_HOST}
