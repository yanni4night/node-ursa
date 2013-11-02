
if [ -z "$1" ];then
    ports=8899/8443
else
    ports=$1
fi
node ../../bin/node-ursa -s $ports