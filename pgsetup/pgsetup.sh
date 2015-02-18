#!/bin/bash
# Set up postgres db for local debugging.
#

# Install postgres
sudo apt-get install -y postgresql postgresql-contrib

# Symlink into home.
# Note the use of backticks, PWD, and the -t flag.
#ln -sf `ls $PWD/.pgpass` -t $HOME
chmod 600 $HOME"/.pgpass"

# Extract variables from the .pgpass file
# stackoverflow.com/a/5257398
# goo.gl/X51Mwz
PGPASS=`cat .pgpass`
TOKS=(${PGPASS//:/ })
PG_HOST=${TOKS[0]}
PG_PORT=${TOKS[1]}
PG_DB=${TOKS[2]}
PG_USER=${TOKS[3]}
PG_PASS=${TOKS[4]}

# Now set up the users
#
# If you don't type in the password right, easiest is to change the value in
# pgpass and try again. You can also delete the local postgres db
# if you know how to do that.
echo -e "\n\nINPUT THE FOLLOWING PASSWORD TWICE BELOW: "${PG_PASS}
sudo -u postgres createuser -U postgres -E -P -s $PG_USER
sudo -u postgres createdb -U postgres -O $PG_USER $PG_DB

# Test that it works.
# Note that the symlinking of pgpass into $HOME should pass the password to psql and make these commands work.
echo "CREATE TABLE \"Users\"(username VARCHAR(32), password VARCHAR(64), email VARCHAR(64), \"resetPasswordToken\" timestamp, \"resetPasswordExpires\" timestamp, \"isActive\" VARCHAR(16), \" createdAt \" timestamp, \" updatedAt \" timestamp);"  | psql -d $PG_DB -U $PG_USER
echo "INSERT INTO \"Users\"(username, password, email, \" createdAt \", \" updatedAt \", \"isActive\") VALUES('demo', '', 'juvasquez88@gmail.com', current_timestamp, current_timestamp, 'yes');" | psql -d $PG_DB -U $PG_USER
