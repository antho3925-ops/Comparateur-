"""Timing des plans et des répliques de l'ép.3 -> fbz/src/timeline3.json (à partir de voices3.json)."""
import json,sys
S=sys.argv[1]; V=json.load(open(S+'/fbz/src/voices3.json'))
tl={'total':2190,
 # carton, rappel ép.2, 5 scènes, « À suivre », teaser
 'scenes':{'open':[0,60],'recap':[60,240],'s1':[240,540],'s2':[540,810],'s3':[810,1200],'s4':[1200,1500],
           's5':[1500,1890],'suivre':[1890,1980],'teaser':[1980,2190]},
 'holo':300,'s1close':330,'glow':470,
 's2shots':[540,630,720],'liftoff':650,
 's3screen':[935,1010],
 's4shots':[1200,1300],
 's5shots':[1500,1570],'fade':[1855,1890],
 'teaserShots':[1980,2045,2110],
 'voices':{'n1':{'start':64,'who':'nar'},'l1':{'start':330,'who':'veg'},'l2':{'start':875,'who':'kiwi'},
           'l3':{'start':1045,'who':'pp'},'l4':{'start':1590,'who':'nam'},'l5':{'start':1745,'who':'kiwi'},
           'n2':{'start':1992,'who':'nar'}}}
# la réplique doit finir avant ce repère
limit={'n1':240,'l1':515,'l2':1010,'l3':1150,'l4':1720,'l5':1855,'n2':2175}
# découpage des sous-titres en morceaux
chunks={'n1':["Précédemment dans Fruit Ball Z...","Pour vaincre Raditz, Pomgoku s'est sacrifié aux côtés de Kiwikolo."],
 'l1':["Sept boules...","et l'immortalité pour celui qui les réunit.","Cette fois, c'est moi qui gagnerai."],
 'l2':["On y va ensemble,","mais je ne te fais pas confiance une seconde."],
 'l3':["Et si on n'arrive pas à temps pour Papa ?"],
 'l4':["Qui êtes-vous ?","Pourquoi venez-vous chercher nos boules sacrées ?"],
 'l5':["Nous ne voulons pas de mal.","Nous voulons ramener un ami à la vie."],
 'n2':["Dans le prochain épisode...","Litcheezer entre en scène !"]}
for k,v in tl['voices'].items():
    n=V[k]['frames']; v['end']=v['start']+n
    assert v['end']<=limit[k], (k, v['end'], limit[k])
    cuts=V[k].get('cuts',[])
    if cuts and len(cuts)==len(chunks[k])-1:
        bounds=[v['start']]+[v['start']+c for c in cuts]+[v['end']]
        v['subs']=[{'text':c,'from':bounds[i],'to':bounds[i+1]} for i,c in enumerate(chunks[k])]
    else:
        v['subs']=[{'text':chunks[k][0],'from':v['start'],'to':v['end']}]
    v['cuts']=[v['start']+c for c in cuts]
    print(k,v['start'],v['end'],[s['from'] for s in v['subs']])
json.dump(tl,open(S+'/fbz/src/timeline3.json','w'),indent=1)
