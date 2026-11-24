/**
 * The flame inside the center tab's gold button. Three layered tongues of
 * fire (ember, flame, white-hot core) each flicker on their own loop, with
 * sparks rising off the top. It burns all the time; when the button is
 * hovered, focused or pressed (.fire-btn on the parent) it burns faster,
 * taller and brighter. Motion lives in globals.css under "Fire".
 */
export default function FireIcon() {
  return (
    <span aria-hidden className="fire">
      <svg viewBox="0 0 32 40" className="fire-svg">
        <defs>
          <linearGradient id="fire-outer" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#5c1400" />
            <stop offset="0.55" stopColor="#b52a00" />
            <stop offset="1" stopColor="#e2470a" />
          </linearGradient>
          <linearGradient id="fire-mid" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#d23c00" />
            <stop offset="1" stopColor="#ff8a1c" />
          </linearGradient>
          <linearGradient id="fire-core" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ffb238" />
            <stop offset="1" stopColor="#fff3c4" />
          </linearGradient>
        </defs>
        <path
          className="fire-outer"
          fill="url(#fire-outer)"
          d="M16 1c1.6 6.2 7.8 9.6 10.6 15.8 3.4 7.5-.8 18.6-10.6 19.2C6.2 35.4 2 26.6 4.6 19.4 6 15.4 9 13.2 10 9.6c2 3 2.4 5.2 2.6 7.6C15.6 12.2 16.8 7 16 1Z"
        />
        <path
          className="fire-mid"
          fill="url(#fire-mid)"
          d="M16.6 10c1 4.6 5.8 7.4 6.8 12.2 1.2 6-2.6 11.2-7.6 11.4-5 .2-8.6-4.6-7.6-9.6.6-3 2.8-4.6 3.6-7.2 1.4 2 1.6 3.6 1.8 5.4 2.2-3.4 3.4-7 3-12.2Z"
        />
        <path
          className="fire-core"
          fill="url(#fire-core)"
          d="M16.2 19c.6 3 3.6 4.6 3.8 8 .2 3.4-1.8 5.6-4.2 5.6s-4.2-2-3.8-4.8c.3-2 1.6-3 2.2-4.6.8 1 1 2 1.1 3 1.2-2 1.4-4.2.9-7.2Z"
        />
      </svg>
      <span className="fire-spark fire-spark-1" />
      <span className="fire-spark fire-spark-2" />
      <span className="fire-spark fire-spark-3" />
    </span>
  );
}
