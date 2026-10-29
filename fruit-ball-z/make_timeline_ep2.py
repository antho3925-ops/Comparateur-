"""Timing des plans et des répliques de l'ép.2 -> fbz/src/timeline2.json (à partir de voices2.json)."""
import json,sys
S=sys.argv[1]; V=json.load(open(S+'/fbz/src/voices2.json'))
tl={'total':2265,
 # carton, rappel ép.1, 5 scènes, « À suivre », teaser
 'scenes':{'open':[0,60],'recap':[60,240],'s1':[240,580],'s2':[580,940],'s3':[940,1150],'s4':[1150,1585],
           's5':[1585,1945],'suivre':[1945,2035],'teaser':[2035,2265]},
 'kiwiLand':300,
 's2shots':[580,630,680,730,790],'s2hits':[648,664,700,716,748,764,776],
 'bite':990,'shakeOff':1100,'musicBack':1115,
 'grabbed':1185,'closeup':1215,'holdShot':1356,'fire':1505,'hit':1550,
 's5close':1650,'eyesClose':[1830,1870],'fade':[1875,1915],
 'teaserShots':[2035,2100,2165],
 'voices':{'n1':{'start':64,'who':'nar'},'l1':{'start':350,'who':'kiwi'},'l2':{'start':498,'who':'pom'},
           'l3':{'start':808,'who':'rad'},'p1':{'start':944,'who':'pp'},'l4':{'start':1000,'who':'rad'},
           'l5':{'start':1270,'who':'kiwi'},'l6':{'start':1400,'who':'rad'},'l7':{'start':1700,'who':'pom'},
           'n2':{'start':2045,'who':'nar'}}}
# la réplique doit finir avant ce repère
limit={'n1':240,'l1':490,'l2':580,'l3':940,'p1':990,'l4':1100,'l5':1356,'l6':1505,'l7':1830,'n2':2250}
# découpage des sous-titres en morceaux
chunks={'n1':["Précédemment dans Fruit Ball Z...","Raditz, un guerrier venu de l'espace, a enlevé Petit-Poirsan, le fils de Pomgoku\u00a0!"],
 'l1':["On oublie nos différends.","Aujourd'hui, on se bat ensemble."],
 'l2':["Je ne le laisserai pas repartir avec mon fils."],
 'l3':["Vous croyez vraiment","pouvoir m'arrêter à deux\u00a0?"],
 'p1':["Laisse mon papa tranquille\u00a0!"],
 'l4':["AÏÏÏÏE\u00a0!","Lâche ma jambe, sale pépin\u00a0!"],
 'l5':["Pomgoku, tiens-le\u00a0!","Je n'ai qu'un seul tir\u00a0!"],
 'l6':["Lâche-moi, idiot\u00a0!","Tu vas y passer, toi aussi\u00a0!"],
 'l7':["Protège-le...","protège tout le monde..."],
 'n2':["Dans le prochain épisode...","Voyage vers Namek\u00a0!"]}
for k,v in tl['voices'].items():
    n=V[k]['frames']; v['end']=v['start']+n
    assert v['end']<=limit[k], (k, v['end'], limit[k])
    cuts=V[k].get('cuts',[])
    if cuts and len(cuts)==len(chunks[k])-1:
        bounds=[v['start']]+[v['start']+c for c in cuts]+[v['end']]
        v['subs']=[{'text':c,'from':bounds[i],'to':bounds[i+1]} for i,c in enumerate(chunks[k])]
    else:
        v['subs']=[{'text':chunks[k][0],'from':v['start'],'to':v['end']}]
    print(k,v['start'],v['end'],[s['from'] for s in v['subs']])
json.dump(tl,open(S+'/fbz/src/timeline2.json','w'),indent=1)
