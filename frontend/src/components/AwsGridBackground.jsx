import { Cloud, Code, Cpu, Box, Rocket, Server } from 'lucide-react';

/**
 * AwsGridBackground — Official AWS SBG brand background texture.
 *
 * Blocks are reduced to opacity:0.18 so they act as subtle watermarks.
 * Two-layer fade protects the horizontal content band in the center.
 */

const GREEN = '#00E582';
const BLUE  = '#38BDF8';
const ICON  = '#0d1117';

const AwsGridBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none"
      style={{ backgroundColor: '#161D26' }}
    >
      {/* ── 1. Grid Lines (80 × 80 px cells) ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), ' +
            'linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── 2. Brand Blocks — ALL at opacity 0.18 (watermark level) ── */}

      {/* TOP-LEFT CLUSTER */}
      <Block top={0} left={0}   size={80}  color={GREEN} opacity={0.18}><Cloud  style={{ width: 36, height: 36, color: ICON }} /></Block>
      <Block top={0} left={160} size={80}  color={GREEN} opacity={0.18} />
      <Block top={0} left={320} size={80}  color={GREEN} opacity={0.18} />
      <Block top={80} left={80}  size={80} color={BLUE}  opacity={0.18} />
      <Block top={80} left={240} size={80} color={GREEN} opacity={0.18}><Code   style={{ width: 36, height: 36, color: ICON }} /></Block>
      <Block top={160} left={0}  size={80} color={BLUE}  opacity={0.18} />
      <Block top={160} left={160}size={80} color={BLUE}  opacity={0.18} />

      {/* TOP-RIGHT CLUSTER */}
      <Block top={0}   right={0}   size={160} color={BLUE}  opacity={0.18} />
      <Block top={0}   right={240} size={80}  color={GREEN} opacity={0.18}><Server style={{ width: 36, height: 36, color: ICON }} /></Block>
      <Block top={0}   right={400} size={80}  color={GREEN} opacity={0.18} />
      <Block top={160} right={0}   size={80}  color={GREEN} opacity={0.18} />
      <Block top={160} right={80}  size={80}  color={BLUE}  opacity={0.18} />
      <Block top={160} right={240} size={80}  color={GREEN} opacity={0.18} />

      {/* LEFT EDGE MIDDLE */}
      <Block top="38%"              left={0}  size={80} color={GREEN} opacity={0.18}><Cpu style={{ width: 36, height: 36, color: ICON }} /></Block>
      <Block top="calc(38% + 80px)" left={80} size={80} color={BLUE}  opacity={0.18} />

      {/* RIGHT EDGE MIDDLE */}
      <Block top="38%"              right={0}  size={80} color={GREEN} opacity={0.18}><Box style={{ width: 36, height: 36, color: ICON }} /></Block>
      <Block top="calc(38% + 80px)" right={80} size={80} color={BLUE}  opacity={0.18} />

      {/* BOTTOM-LEFT CLUSTER */}
      <Block bottom={80}  left={0}   size={80}  color={GREEN} opacity={0.18}><Rocket style={{ width: 36, height: 36, color: ICON }} /></Block>
      <Block bottom={0}   left={0}   size={160} color={BLUE}  opacity={0.18} height={80} />
      <Block bottom={80}  left={240} size={80}  color={GREEN} opacity={0.18} />
      <Block bottom={0}   left={240} size={80}  color={BLUE}  opacity={0.18} />
      <Block bottom={0}   left={400} size={80}  color={GREEN} opacity={0.18} />

      {/* BOTTOM-RIGHT CLUSTER */}
      <Block bottom={0}   right={0}   size={80} color={GREEN} opacity={0.18} />
      <Block bottom={0}   right={160} size={80} color={BLUE}  opacity={0.18} />
      <Block bottom={80}  right={80}  size={80} color={GREEN} opacity={0.18} />
      <Block bottom={160} right={0}   size={80} color={BLUE}  opacity={0.18} />
      <Block bottom={80}  right={240} size={80} color={BLUE}  opacity={0.18} />
      <Block bottom={0}   right={320} size={80} color={GREEN} opacity={0.18} />

      {/* ── 3. Two-Layer Center & Horizontal Readability Fade ──
           Layer A: Heavy radial vignette covering center 40%
           Layer B: Horizontal band that darkens the full mid-section
           Together they protect the entire horizontal content area.
      ── */}
      {/* Layer A — Radial center vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(22,29,38,0.95) 40%, rgba(22,29,38,0.4) 100%)',
        }}
      />
      {/* Layer B — Horizontal band fade (protects card rows) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(22,29,38,0.80), transparent)',
        }}
      />
    </div>
  );
};

/**
 * Block helper — grid-snapped brand block with controlled opacity.
 */
const Block = ({ top, bottom, left, right, size, height, color, opacity = 1, children }) => {
  const style = {
    position: 'absolute',
    width: size,
    height: height ?? size,
    backgroundColor: color,
    opacity,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  if (top    !== undefined) style.top    = typeof top    === 'number' ? `${top}px`    : top;
  if (bottom !== undefined) style.bottom = typeof bottom === 'number' ? `${bottom}px` : bottom;
  if (left   !== undefined) style.left   = typeof left   === 'number' ? `${left}px`   : left;
  if (right  !== undefined) style.right  = typeof right  === 'number' ? `${right}px`  : right;

  return <div style={style}>{children}</div>;
};

export default AwsGridBackground;
