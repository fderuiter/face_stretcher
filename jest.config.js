module.exports = {
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    transform: {
        '^.+\\.[t|j]sx?$': 'babel-jest'
    },
    transformIgnorePatterns: [
        '/node_modules/(?!three|@tensorflow)'
    ]
};
