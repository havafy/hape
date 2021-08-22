# Installing Elasticdump:
Now run the below command to install elasticdump in your machine.

### Global installation:
npm install elasticdump -g

### PULL ES data to json files
multielasticdump \
  --direction=dump \
  --match='^.*$' \
  --input=http://localhost:9210 \
  --output=./es_backup


### PULL from production ES to development ES
elasticdump \
  --input=http://localhost:9300 \
  --output=http://localhost:9210 \
  --type=data