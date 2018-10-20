#!/bin/bash
mysqldump --host 192.168.1.111 --port 3335 -u user --no-data -p renderer > db.sql
