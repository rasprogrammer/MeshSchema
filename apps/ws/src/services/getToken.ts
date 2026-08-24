

export const getToken = (url: string): string | null => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.searchParams.get('token');
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
}