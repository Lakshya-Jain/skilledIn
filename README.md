# Ponytail profile preview

The profile and compact scroll header come from separate SkilledIn frames in Paper. The main navigation stays pinned, and the compact profile header appears beneath it once the profile intro scrolls out of view. The site uses Paper's exported JSX, variables and images. The build renders static HTML, so the preview has no server or runtime dependencies.

Open `dist/index.html` in a browser after running `npm install` and `npm run build`. Use `npm run dev` to serve it at `http://127.0.0.1:4173`.

The sample button scrolls to the work sample. The attachment action opens Ponytail's installation instructions. The source and benchmark actions open the corresponding sections or documents. Other controls are presentational, and private network activity is illustrative.

For a Vercel preview, import the repository and select this folder as the project root if needed. The included configuration runs the build and serves `dist`. Review the prototype and its illustrative data before publishing.
