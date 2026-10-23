{
  description = "Arman portfolio (React + Vite + Supabase) dev shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = f:
        nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          name = "arman-portfolio";

          packages = with pkgs; [
            nodejs_22
            # wrangler      # Cloudflare CLI
            # supabase-cli  # Supabase CLI
          ];

          shellHook = ''
            echo "arman-portfolio dev shell"
            echo "node $(node --version) | npm $(npm --version)"

            export NPM_CONFIG_PREFIX="$PWD/.npm-global"
            export PATH="$NPM_CONFIG_PREFIX/bin:$PWD/node_modules/.bin:$PATH"

            if [ ! -d node_modules ]; then
              echo "tip: run 'npm install' first"
            fi
            if [ ! -f .env ] && [ -f .env.example ]; then
              echo "tip: cp .env.example .env and fill in the Supabase + Web3Forms keys"
            fi
          '';
        };
      });

      formatter = forAllSystems (pkgs: pkgs.nixpkgs-fmt);
    };
}