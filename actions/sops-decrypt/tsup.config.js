import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/main.ts', 'src/post.ts'],
    noExternal: true
    // splitting: false,
    // sourcemap: true,
    // clean: true,
})
