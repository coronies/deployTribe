#!/bin/bash

# Kill any existing Firebase emulator processes
echo "Stopping any existing Firebase emulators..."
pkill -f "firebase emulators"

# Wait a moment for processes to stop
sleep 3

# Start the Firebase emulators
echo "Starting Firebase emulators..."
firebase emulators:start --only auth,firestore,storage

echo "Firebase emulators started successfully!"
echo "Emulator UI: http://localhost:4090"
echo "Auth Emulator: http://localhost:9090"
echo "Firestore Emulator: http://localhost:8090"
echo "Storage Emulator: http://localhost:9190" 