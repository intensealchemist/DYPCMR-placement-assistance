export const theme = {
    colors: {
        primary: '#0A1128', // Midnight Blue
        secondary: '#1B264F', // Dark Blue
        accent: '#FFD700', // Gold
        success: '#10B981',
        error: '#EF4444',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: {
            primary: '#0F172A',
            secondary: '#64748B',
            light: '#F8FAFC',
            accent: '#FFD700',
        },
        border: '#E2E8F0',
    },
    typography: {
        fontFamily: {
            regular: 'System', // Use system font for now, can add custom fonts later
            bold: 'System',
        },
        sizes: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
            xxl: 24,
            xxxl: 32,
        },
        weights: {
            regular: '400',
            medium: '500',
            bold: '700',
        },
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 20,
        full: 9999,
    },
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
            elevation: 1,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
    },
};
