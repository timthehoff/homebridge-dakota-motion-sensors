FROM navikey/raspbian-bullseye

USER root

# Dependencies
RUN apt-get update
RUN apt-get install -y libatomic1
RUN apt-get install -y curl apt-transport-https

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

# Install Python GPIO package
RUN apt-get install -y python3-rpi.gpio

# Install Homebridge
RUN curl -sSfL https://repo.homebridge.io/KEY.gpg | gpg --dearmor | tee /usr/share/keyrings/homebridge.gpg > /dev/null
RUN echo "deb [signed-by=/usr/share/keyrings/homebridge.gpg] https://repo.homebridge.io stable main" | tee /etc/apt/sources.list.d/homebridge.list > /dev/null
RUN apt-get update
RUN apt-get install -y homebridge

EXPOSE 8581
WORKDIR /home/homebridge

# Start Homebridge in container
CMD /opt/homebridge/start.sh --allow-root
