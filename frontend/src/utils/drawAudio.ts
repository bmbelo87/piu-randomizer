export async function playPreview(
    audioContext: AudioContext,
    url: string
): Promise<void> {

    const response =
        await fetch(url);

    const arrayBuffer =
        await response.arrayBuffer();

    const audioBuffer =
        await audioContext
            .decodeAudioData(
                arrayBuffer
            );

    const source =
        audioContext
            .createBufferSource();

    source.buffer =
        audioBuffer;

    source.connect(
        audioContext.destination
    );

    source.start(0);

    return new Promise(
        resolve => {

            source.onended =
                () => resolve();
        }
    );
}
