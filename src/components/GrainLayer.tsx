import { useEffect, useRef } from 'react';

const VERT = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
out vec4 glFragColor;
uniform vec3 u_color;
uniform float u_scale;
void main(){
    float scale = 5.*(1.001-u_scale/1.1);
    vec2 coord = scale*(gl_FragCoord.xy + vec2(1.0,0.0));
    int val = ((int(coord.x) & int(coord.y)) % 3);
    float result = 0.0;
    vec3 col = vec3(0.0);
    vec3 col_prev;
    for(int i = 0; i < 9; i++){
        col_prev = col;
        coord.y += (2.0+result)/2.0;
        coord += coord.yy/4.0;
        coord = coord.yx/(2.0);
        result = ((result + float(val = ((int(coord.x) | int(coord.y)) % (3+val))))/(2.0));
        col.x = (result+col.z)/2.0;
        col = (fract((col.yzx))+col_prev)/2.0;
    }
    glFragColor = vec4(u_color, col.r);
}
`;

interface GrainLayerProps {
  className?: string;
  style?: React.CSSProperties;
}

export function GrainLayer({ className, style }: GrainLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uColor = gl.getUniformLocation(prog, 'u_color');
    const uScale = gl.getUniformLocation(prog, 'u_scale');
    gl.uniform3f(uColor, 0, 0, 0);
    gl.uniform1f(uScale, 0.01);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const draw = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.round(window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(parent);

    return () => {
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} style={style} aria-hidden="true" />;
}
