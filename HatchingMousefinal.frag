#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_tex0;  // Input texture

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Time-dependent exposure adjustment
    float exposureTime = smoothstep(0.0, 20.0, u_time);
    vec4 originalColor = texture2D(u_tex0, uv);
    vec3 exposureAdjustedColor = originalColor.rgb * exposureTime;

    // Apply distortion to UV coordinates for a weaving-like effect
    float distortion = sin(uv.y * 10.0 + u_time * 2.0) * 0.003; // Adjust distortion intensity
    uv.x += distortion;
    uv.y += distortion * 0.1; // Adjust the Y direction distortion intensity

    // Sample the input texture (watercolor)
    vec4 texColor = texture2D(u_tex0, uv);

    // Calculate brightness (luminance) of the pixel
    float brightness = dot(texColor.rgb, vec3(0.5126, 0.55152, 0.0722));

    // Invert brightness
    float invertedBrightness = 0.88 - brightness;

    // Enhance colors by exaggerating saturation
    vec3 enhancedColor = texColor.rgb * 1.2; // Adjust this factor to control color enhancement

    // Calculate distance from the center
    vec2 center = vec2(0.37); // Adjust the center point if needed
    float distance = distance(uv, center);

    // Define fog parameters
    float fogStart = 0.3; // Start of the fog effect
    float fogEnd = 0.6;   // End of the fog effect
    float fogAmount = smoothstep(fogStart, fogEnd, distance);

    // Interpolate fog color with the final color (using a bluish tint)
    vec3 fogColor = vec3(0.1, 0.01, 0.9); // Adjust fog color as needed (more blue)
    vec3 foggedColor = mix(enhancedColor, fogColor, fogAmount);

    // Apply canvas texture to the fogged color with some blending
    vec4 canvasTexture = texture2D(u_tex0, uv * 8.0); // Adjust UV scaling as needed
    vec3 finalColor = mix(foggedColor, canvasTexture.rgb, 0.);

    // Make the brightest parts darker and vice versa (adjusting with a bluish tint)
    finalColor = mix(finalColor, vec3(invertedBrightness, invertedBrightness, 1.0), 1.7); // More blue

    // Set alpha to 1.0
    vec4 outputColor = vec4(finalColor, 0.9);

    gl_FragColor = mix(originalColor, outputColor, exposureTime);
}
