# knockout-sample-with-django

1. First install viertual Environment(if not already installed)

2. Create your virtual environment using "virtualenv {name_of_your_virtualenv}"

3. Activate your virtual environment using "source name_of_your_virtualenv/bin/activate"

4. Install all requirements by "pip install -r requirements.txt"

5. Now go to Project directory by cd Project/

6. Now we have to make migrations of our modals. So run this command "python manage.py makemigrations", if there is any ossue try this "python manage.py makemigrations"

7. Now run this commnd "python manage.py migrate", this will create Model's table in db.sqlite3

8. Start server using "python manage.py runserver" and Enjoy........