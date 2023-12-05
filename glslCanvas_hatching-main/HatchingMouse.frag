// YI-HE
// Title: Watercolor Texture with Fog Halo and Mobile Interaction

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;  // Input texture

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;


    // Apply distortion to UV coordinates for a weaving-like effect
    uv.x += 0.0001 * sin(uv.y * 20.0 + u_time * 1.0);
    uv.y += 0.003 * sin(uv.x * 20.0 + u_time * 1.0);

    // Sample the input texture (watercolor)
    vec4 texColor = texture2D(u_tex0, uv);

    // Calculate brightness (luminance) of the pixel
    float brightness = dot(texColor.rgb, vec3(0.826, 0.6152, 0.622));

    // Invert brightness
    float invertedBrightness = 1.34 - brightness;

    // Enhance colors by exaggerating saturation
    vec3 enhancedColor = texColor.rgb * 6.5; // Adjust this factor to control color enhancement

    // Define fog parameters based on touch input
    float fogStart = 0.2; // Start of the fog effect
    float fogEnd = 0.5;   // End of the fog effect

    // Calculate touch position normalized to the canvas
    vec2 touchPos = u_mouse / u_resolution;
    float touchDistance = distance(uv, touchPos);
    float touchFogAmount = smoothstep(fogStart, fogEnd, touchDistance);

    // Interpolate fog color with the final color based on touch input
    vec3 fogColor = vec3(0.5, 0.5, 0.5); // Adjust fog color as needed
    vec3 foggedColor = mix(enhancedColor, fogColor, touchFogAmount);

    // Apply canvas texture to the fogged color with some blending
    vec4 canvasTexture = texture2D(u_tex0, uv * 10.0); // Adjust UV scaling as needed
    vec3 finalColor = mix(foggedColor, canvasTexture.rgb, 0.);

    // Make the brightest parts darkest and vice versa
    finalColor = mix(finalColor, vec3(invertedBrightness), 1.2); // Adjust the second parameter for effect strength

    // Set alpha to 1.0
    vec4 outputColor = vec4(finalColor, 1.0);

    gl_FragColor = outputColor;
}
