# build_files.sh
echo "Building project..."
cd backend
python3 manage.py collectstatic --noinput --clear
python3 manage.py migrate --noinput
python3 manage.py create_default_superuser
echo "Build completed!"
