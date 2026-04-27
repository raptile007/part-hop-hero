CREATE USER 'bikeuser'@'localhost' IDENTIFIED BY 'strongpassword';
GRANT ALL PRIVILEGES ON bike_spares.* TO 'bikeuser'@'localhost';
FLUSH PRIVILEGES;