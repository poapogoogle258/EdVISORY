FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY ./ ./

# Create uploads directory
RUN mkdir -p uploads

# Set environment variables
ENV APP_USERNAME=${APP_USERNAME}
ENV APP_PASSWORD=${APP_PASSWORD}
ENV PORT=${PORT}
ENV DB_HOST=${DB_HOST}
ENV DB_PORT=${DB_PORT}
ENV DB_NAME=${DB_NAME}
ENV DB_USERNAME=${DB_USERNAME}
ENV DB_PASSWORD=${DB_PASSWORD}

# Expose port
EXPOSE ${PORT}

# Start command
CMD ["npm", "run", "start"]