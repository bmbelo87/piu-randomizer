import pumpArrow from "../assets/pumpArrow.png";

const arrows = [
    [2, 6, 0, 90, 22], [8, 10, 7, 180, 27],
    [15, 13, 14, 270, 23], [23, 17, 4, 90, 29],
    [31, 8, 11, 270, 21], [39, 18, 2, 180, 25],
    [47, 12, 9, 90, 31], [55, 7, 6, 270, 24],
    [63, 16, 13, 180, 28], [71, 11, 3, 90, 26],
    [78, 7, 10, 270, 20], [84, 15, 1, 180, 30],
    [90, 9, 15, 90, 24], [96, 18, 5, 270, 32]
] as const;

export default function AmbientArrows() {
    return (
        <div className="ambient-arrows" aria-hidden="true">
            {arrows.map(([left, size, delay, rotation, duration], index) => (
                <div
                    key={index}
                    className="ambient-arrow"
                    style={{
                        left: `${left}%`,
                        width: `${size}rem`,
                        animationDelay: `-${delay}s`,
                        animationDuration: `${duration}s`,
                        filter: `hue-rotate(${index * 37}deg) saturate(1.35)`
                    }}
                >
                    <img
                        src={pumpArrow}
                        alt=""
                        className="ambient-arrow-image"
                        style={{ rotate: `${rotation}deg` }}
                    />
                </div>
            ))}
        </div>
    );
}
