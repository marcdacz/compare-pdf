/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
	arrowParens: "always",
	bracketSpacing: true,
	printWidth: 120,
	quoteProps: "consistent",
	semi: true,
	singleQuote: false,
	tabWidth: 2,
	trailingComma: "none",
	useTabs: true,
	overrides: [
		{
			files: "*.json",
			options: { parser: "jsonc" }
		},
		{
			files: "*.{yml,yaml}",
			parser: "yaml-eslint-parser"
		},
		{
			files: "*.md",
			parser: "markdown"
		},
		{
			files: "*.ts",
			parser: "markdown"
		}
	],
	plugins: ["@prettier/plugin-xml"]
};

export default config;
