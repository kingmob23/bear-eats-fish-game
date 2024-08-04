cat /etc/nginx/sites-available/default
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
systemctl reload nginx

cat ~/game_server.log

cat ~/scripts/start_game_server.sh

# run locally
npx webpack serve