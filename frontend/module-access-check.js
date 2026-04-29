/**
 * Fallback path for pages using <base href="/"> + module-access-check.js
 * Keeps old script references working in production.
 */
(async function () {
    console.log('✅ Module access check disabled - all modules are open');
})();

