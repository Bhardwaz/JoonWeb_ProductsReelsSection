export const usePageType = () => {
    const pageType = window.location.pathname

    if (path === '/') return 'home';
    if (path.includes('/products/')) return 'products';
    if (path.includes('/collections/')) return 'collection';

    return 'general';
}