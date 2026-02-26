import { io } from 'socket.io-client';

export class WebRTCManager {
    constructor(signalingUrl) {
        this.signalingUrl = signalingUrl;
        this.socket = null;
        this.peerConnection = null;
        this.dataChannel = null;
        this.mediaStream = null;
        this.onMessage = null;
        this.isConnected = false;
    }

    async connect() {
        console.log("[WebRTC] Connecting to signaling server:", this.signalingUrl);
        this.socket = io(this.signalingUrl);

        this.socket.on('connect', () => {
            console.log("[WebRTC] Signaling connected");
            this.setupPeerConnection();
        });

        this.socket.on('offer', async (offer) => {
            if (!this.peerConnection) this.setupPeerConnection();
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.socket.emit('answer', answer);
        });

        this.socket.on('candidate', async (candidate) => {
            if (this.peerConnection) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });
    }

    setupPeerConnection() {
        const config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };

        this.peerConnection = new RTCPeerConnection(config);

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('candidate', event.candidate);
            }
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log("[WebRTC] Connection state:", this.peerConnection.connectionState);
            this.isConnected = this.peerConnection.connectionState === 'connected';
        };

        // Data Channel for low-latency analysis results
        this.peerConnection.ondatachannel = (event) => {
            const receiveChannel = event.channel;
            receiveChannel.onmessage = (e) => {
                if (this.onMessage) this.onMessage(JSON.parse(e.data));
            };
        };
    }

    async startStreaming(stream) {
        if (!this.peerConnection) {
            console.warn("[WebRTC] PeerConnection not ready");
            return;
        }

        stream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, stream);
        });

        // Create Offer
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.socket.emit('offer', offer);
    }

    stop() {
        if (this.peerConnection) this.peerConnection.close();
        if (this.socket) this.socket.disconnect();
        this.isConnected = false;
    }
}
