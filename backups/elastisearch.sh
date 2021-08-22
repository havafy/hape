# npm install elasticdump -g


rm -rf ./es_backup

mkdir ./backup_files 
mkdir ./es_backup 

multielasticdump \
  --direction=dump \
  --match='^.*$' \
  --input=http://localhost:9210 \
  --output=./es_backup


tar -zcvf "es_$(date +"%Y_%m_%d_%I_%M_%p").tar.gz" ./es_backup

mv es_*.tar.gz backup_files/