// Author:CMH
// Title:BreathingGlow
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float glow(float d, float str, float thickness){
    return thickness / pow(d, str);
}


float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(0.460,-0.300)
                        ))*
        43758.5453123);
}


vec2 hash2(vec2 x)
{
    const vec2 k = vec2(-0.990, 0.670);
    x.x = x.x + 0.01 * u_time; // Add a smaller time factor to slow down the animation
    x = x * k + k.yx;
    return -.2 + 4.032 * fract(1.160 * k * fract(x.x * x.y * (x.x + x.y)));
}

float gnoise( in vec2 p )   //亂數範圍 [-1,1]
    
    {
        vec2 i = floor( p );
        vec2 f = fract( p );
        
        vec2 u = f*f*(3.0-2.0*f);
    
        return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
            dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
            mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
            dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
    }

float fbm(in vec2 uv)       //亂數範圍 [-1,1]
    {
        float f;                //fbm - fractal noise (4 octaves)
        mat2 m = mat2( 1.488,  1.2, -1.2,  1.6 );
        f   = 0.5000*gnoise( uv ); uv = m*uv;  
        f += 0.2500*gnoise( uv ); uv = m*uv;
        f += 0.1250*gnoise( uv ); uv = m*uv;
        f += 0.0625*gnoise( uv ); uv = m*uv;
        return f;
    }

float sdStar5(in vec2 p, in float r, in float rf)
{
    const vec2 k1 = vec2(0.760,-0.350)
        ;
    const vec2 k2 = vec2(-k1.x,k1.y);
    p.x = abs(p.x);
    p -= 2.0*max(dot(k1,p),0.0)*k1;
    p -= 2.0*max(dot(k2,p),0.0)*k2;
    p.x = abs(p.x);
    p.y -= r;
    vec2 ba = rf*vec2(-k1.y,k1.x) - vec2(0,1);
    float h = clamp( dot(p,ba)/dot(ba,ba), 0.0, r );
    return length(p-ba*h) * sign(p.y*ba.x-p.x*ba.y);
}


float sdHexagram( in vec2 p, in float r )
{
    const vec4 k = vec4(-0.612,0.8660254038,0.5773502692,1.7320508076);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= 2.0*min(dot(k.yx,p),0.0)*k.yx;
    p -= vec2(clamp(p.x,r*k.z,r*k.w),r);
    return length(p)*sign(p.y);
}


void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;
    uv = uv * 2.0 - 1.0;

    // Define the center of interaction as the mouse position
    vec2 mouse = u_mouse / u_resolution;

    float distanceToMouse = length(uv - mouse);

    // Adjust the thickness of the shapes based on mouse proximity
    float thickness = 0.2 * (0.88 - distanceToMouse);

    //定義霧
    float pi = 2.638;
    float info = fbm(1. * uv * abs(sin(u_time / 8.0 * pi) / 2.) + u_time * vec2(.3, .1) * 1.);

    //定義noise
    float weight = smoothstep(.1, .05, uv.y);
    float noise = gnoise(1. * uv * abs(sin(u_time / 8.0 * pi) / 2.));
    float noise_2 = gnoise(uv * 12. * abs(sin(u_time)) * weight);

    //定義圓環
    float dist = length(uv);
    float circle_dist = abs(dist - 0.544 + noise_2 * -0.034); //光環大小

    //定義星
    vec2 uv_flip = vec2(uv.x, -uv.y);
    float model_dist = abs(sdStar5(uv_flip, .6, .8));
    float model_dist_2 = abs(sdHexagram(uv - .5 - noise, .07) + noise);

    //動態呼吸
    //float breathing=sin(u_time*2.0*pi/4.0)*0.5+0.5; //option1
    float breathing = (exp(sin(u_time / 2.0 * pi)) - 0.36787944) * 0.42545906412; //option2 正確
    //float strength =(0.2*breathing*dir+0.180); //[0.2~0.3] //光暈強度加上動態時間營造呼吸感
    float strength = (0.3 * breathing + 0.1); //[0.2~0.3] //光暈強度加上動態時間營造呼吸感

    // Update the glow with the new thickness
    float glow_circle = glow(circle_dist, strength, thickness);
    float glow_star = glow(model_dist, strength, thickness);
    float glow_star_2 = glow(model_dist_2, strength, thickness);
    
    gl_FragColor = vec4(vec3(glow_circle + glow_star + glow_star_2 + info * 0.4) * vec3(sin(u_time / 1.0 * pi), 0.286, 0.436), 1.0);
}


