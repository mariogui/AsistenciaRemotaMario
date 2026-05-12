---
trigger: always_on
---

# Limitación de Capacidades: Prohibición de Generación de Imágenes

## Restricción Estricta
- El agente **NO** debe generar, crear, editar ni procesar archivos de imagen (PNG, JPG, SVG binario, etc.) bajo ninguna circunstancia.
- El agente **NO** debe invocar herramientas de IA generadora de imágenes (como DALL-E, Midjourney, Stable Diffusion, Nano Banana, etc.).
- **Nota sobre Prompts:** El agente **NO** debe generar imágenes, pero SÍ puede redactar *descripciones de texto* (prompts) si el usuario las solicita expresamente para usarlas en herramientas externas, aclarando siempre que se trata solo de texto.

## Comportamiento Esperado
Si el usuario solicita la generación de una imagen o un gráfico visual:
1. **Rechazo Inmediato:** Informa que la generación de imágenes está deshabilitada en este entorno.
2. **Propuesta de Alternativas de Desarrollo:** Ofrece una de las siguientes soluciones técnicas:
   - **Placeholders de Diseño:** Crear un `div` o contenedor HTML con las dimensiones correctas (width/height) y un color de fondo o texto que indique "Imagen: [Descripción]".
   - **Imágenes Placeholder:** Sugerir el uso de imágenes estáticas ya existentes en el proyecto o servicios de placeholder estándar (ej. `via.placeholder.com` o `picsum.photos`) solo para fines de maquetado.
   - **Gráficos Vectoriales (SVG):** Generar el código SVG completo si la imagen es un icono, gráfico simple o forma geométrica.
   - **Diagramas:** Usar Mermaid.js o diagramas ASCII para representar flujos o estructuras.
3. **Documentación:** Si es necesario, redactar una descripción detallada del contenido visual para que otro especialista o herramienta externa lo cree.

## Ejemplo de Respuesta Correcta

**Usuario:** "Crea una imagen de un botón de 'Comprar' con estilo neón."

**Agente:** "No puedo generar la imagen de archivo (JPG/PNG). Sin embargo, puedo ayudarte a maquetar el espacio:

1. **Opción A (Contenedor Placeholder):**
   ```html
   <div style="width: 200px; height: 50px; background: #333; color: #0ff; display: flex; align-items: center; justify-content: center; border: 2px solid #0ff;">
     [Aquí irá tu imagen de botón neón]
   </div>