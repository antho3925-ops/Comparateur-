"""Timing des plans et des répliques de l'ép.6 -> fbz/src/timeline6.json (à partir de voices6.json)."""
import json,sys
S=sys.argv[1]; V=json.load(open(S+'/fbz/src/voices6.json'))
tl={'total':2220,
 # carton, rappel ép.5, 5 scènes, « À suivre », teaser
 'scenes':{'open':[0,60],'recap':[60,240],'s1':[240,600],'s2':[600,840],'s3':[840,1230],'s4':[1230,1590],
           's5':[1590,1920],'suivre':[1920,2010],'teaser':[2010,2220]},
 # scène 1 : gros plan coque, épines, héros qui reculent, croissance
 's1shots':[240,330,420,480],'grow':[450,570],
 # scène 3 : charge, pichenette (ralenti), rebond dans la poussière
 'charge':958,'flick':1000,'land':1072,'bounce':1100,
 # scène 4 : veines dorées, plans de réaction
 'veins':[1250,1400],'s4shots':[1230,1330,1480],
 # scène 5 : aura, cailloux, flash doré
 'aura':1600,'s5shots':[1590,1680,1810],'flash':1888,
 'teaserShots':[2010,2080,2150],
 'voices':{'n1':{'start':64,'who':'nar'},'l1':{'start':648,'who':'lit'},'l2':{'start':878,'who':'veg'},
           'l3':{'start':1128,'who':'lit'},'l4':{'start':1388,'who':'pom'},'l5':{'start':1700,'who':'nar'},
           'n2':{'start':2022,'who':'nar'}}}
# la réplique doit finir avant ce repère
limit={'n1':238,'l1':818,'l2':956,'l3':1228,'l4':1478,'l5':1850,'n2':2148}
chunks={'n1':["Précédemment dans Fruit Ball Z...","Pomgoku a enfin débarqué sur Namek, mais Litcheezer a esquivé tous ses coups en souriant."],
 'l1':["Voici ma deuxième forme.","J'espère que ton cœur tiendra le choc."],
 'l2':["Je n'ai pas fait tout ce chemin pour reculer devant toi !"],
 'l3':["Tu es fort...","pour un fruit ordinaire."],
 'l4':["Arrête ça...","arrête ça tout de suite !"],
 'l5':["Et dans cette rage,","quelque chose d'ancien se réveillait enfin."],
 'n2':["Dans le prochain épisode...","Super Pomgoku !"]}
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
json.dump(tl,open(S+'/fbz/src/timeline6.json','w'),indent=1)
