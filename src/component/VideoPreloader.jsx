import React, { useEffect, useRef } from 'react';

const Preloader = ({ url, mimeType }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.preload = "auto";
        video.load();

        return () => {
            video.removeAttribute('src'); 
            video.load();
        };
    }, [url]);

    return (
        <video
            ref={videoRef}
            className="hidden"
            width="0"
            height="0"
            muted={true}
            playsInline
        >
            <source src={url} type={mimeType || "application/x-mpegURL"} />
        </video>
    );
};

const VideoPreloader = ({ item }) => {
    if (!item || !item.url) return null;

    return <Preloader url={item.url} mimeType={item.mimeType} />;
};

export default VideoPreloader;