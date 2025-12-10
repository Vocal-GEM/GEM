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
            try {
                if (!this.peerConnection) this.setupPeerConnection();
                // Modern API: pass offer object directly (RTCSessionDescription constructor is deprecated)
                await this.peerConnection.setRemoteDescription(offer);
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);
                this.socket.emit('answer', answer);
            } catch (error) {
                console.error('[WebRTC] Error handling offer:', error);
            }
        });

        this.socket.on('candidate', async (candidate) => {
            try {
                if (this.peerConnection && candidate) {
                    // Modern API: pass candidate object directly (RTCIceCandidate constructor is deprecated)
                    await this.peerConnection.addIceCandidate(candidate);
                }
            } catch (error) {
                console.error('[WebRTC] Error adding ICE candidate:', error);
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
                if (this.onMessage) {
                    try {
                        this.onMessage(JSON.parse(e.data));
                    } catch (parseError) {
                        console.error('[WebRTC] Error parsing message:', parseError);
                    }
                }
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
        // Remove socket event listeners to prevent memory leaks
        if (this.socket) {
            this.socket.off('connect');
            this.socket.off('offer');
            this.socket.off('candidate');
            this.socket.disconnect();
            this.socket = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.isConnected = false;
    }
}
