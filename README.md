cat /etc/nginx/sites-available/default
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
systemctl reload nginx

cat ~/game_server.log

cat ~/scripts/start_game_server.sh

# build and run locally
npx webpack --config webpack.config.js --mode production
npx webpack serve