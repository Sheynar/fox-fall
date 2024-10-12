FROM --platform=linux/amd64 mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# Update
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Dependencies for using electron
RUN apt-get update && apt-get install -y libnss3 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0 libcups2 libdrm2 libgbm1 libxss1 libasound2 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxfixes3 libxi6 libxrandr2 libxtst6 libgconf-2-4 dbus-x11 xvfb && rm -rf /var/lib/apt/lists/*