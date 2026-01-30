# build_files.sh
echo "Building project..."
cd backend
python3.9 -m pip install -r requirements.txt
python3.9 manage.py collectstatic --noinput --clear
python3.9 manage.py migrate --noinput
python3.9 manage.py create_default_superuser
echo "Build completed!"
