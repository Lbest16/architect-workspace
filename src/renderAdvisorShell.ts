/** Wraps page content in the advisor dashboard's header and navigation. */
export function renderAdvisorShell(content: string): string {
  return `
    <header class="advisor-header">
      <h1>Client Intelligence</h1>
      <p class="advisor-header__tagline">Advisor Dashboard</p>
    </header>
    <nav class="advisor-nav" aria-label="Primary">
      <a href="#/clients">Clients</a>
    </nav>
    <main class="advisor-content">${content}</main>`;
}
