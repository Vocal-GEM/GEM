<<<<<<< SEARCH
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input[0]) return true;

        const inputChannel = input[0];

        // Fill buffer with incoming audio
        for (let i = 0; i < inputChannel.length; i++) {
            this.buffer[this.bufferIndex++] = inputChannel[i];

            // Process when buffer is full
            if (this.bufferIndex >= this.bufferSize) {
                const startTime = currentTime;
=======
    process(inputs, _outputs, _parameters) {
        const input = inputs[0];
        if (!input || !input[0]) return true;

        const inputChannel = input[0];

        // Fill buffer with incoming audio
        for (let i = 0; i < inputChannel.length; i++) {
            this.buffer[this.bufferIndex++] = inputChannel[i];

            // Process when buffer is full
            if (this.bufferIndex >= this.bufferSize) {
                const startTime = globalThis.currentTime;
>>>>>>> REPLACE
