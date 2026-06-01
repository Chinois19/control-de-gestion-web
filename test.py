import requests
data = {
    'token': 'F03C4EE0F08CD8A846F1621332F966CD',
    'content': 'record',
    'format': 'json',
    'returnFormat': 'json'
}
r = requests.post('https://redcap.araucaniasur.cl/api/',data=data)
print('HTTP Status: ' + str(r.status_code))
try:
    records = r.json()
    print('Total:', len(records))
    if len(records) > 0:
        print('Sample:', records[0])
except Exception as e:
    print('Error parsing JSON:', e)
