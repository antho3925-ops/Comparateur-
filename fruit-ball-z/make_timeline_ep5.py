"""Timing des plans et des répliques de l'ép.5 -> fbz/src/timeline5.json (à partir de voices5.json)."""
import json,sys
S=sys.argv[1]; V=json.load(open(S+'/fbz/src/voices5.json'))
tl={'total':2250,
 # carton, rappel ép.4, 5 scènes, « À suivre », teaser
 'scenes':{'open':[0,60],'recap':[60,240],'s1':[240,570],'s2':[570,900],'s3':[900,1230],'s4':[1230,1620],
           's5':[1620,1950],'suivre':[1950,2040],'teaser':[2040,2250]},
 # s1 : vaisseau fermé, ouverture (vapeur), vue subjective, cri, Pomgoku face au village
 's1shots':[240,345,430,472],'open':290,
 # s2 : ambiance, arrivée des deux guerriers, atterrissage, réplique, réactions
 's2shots':[570,640,700],'land':690,
 # s3 : ciel, révélation en contre-plongée, réactions des héros
 's3shots':[900,960,1185],
 # s4 : réplique de Pomgoku, préparation, échange de coups, ralenti, conséquences
 's4shots':[1230,1345,1390,1525,1570],
 'blows':[1395,1418,1440,1460,1480,1500],
 # s5 : craquements de cou, rire, réplique, sourire, fondu
 'cracks':[1660,1690,1722,1736],'fade':[1905,1950],
 'teaserShots':[2040,2110,2175],
 'voices':{'n1':{'start':64,'who':'nar'},'c1':{'start':432,'who':'pom'},'l1':{'start':476,'who':'pom'},
           'l2':{'start':730,'who':'kiwi'},'l3':{'start':1000,'who':'lit'},
           'l4':{'start':1245,'who':'pom'},'l5':{'start':1752,'who':'lit'},
           'n2':{'start':2050,'who':'nar'}}}
# la réplique doit finir avant ce repère
limit={'n1':240,'c1':474,'l1':570,'l2':850,'l3':1215,'l4':1345,'l5':1905,'n2':2235}
# découpage des sous-titres en morceaux ("" = petit rire sans sous-titre ; le cri n'en a pas)
chunks={'n1':["Précédemment dans Fruit Ball Z...","Litcheezer a réduit en ruines le village des Namekiens."],
 'l1':["Qu'est-ce qui s'est passé ici...","qui a fait ça ?"],
 'l2':["Litcheezer.","Et ce que tu vois n'est qu'un début."],
 'l3':["Oh, une petite pomme qui vient jouer les héros.","Comme c'est mignon.",""],
 'l4':["Je me fiche de ta puissance.","Je vais t'arrêter."],
 'l5':["","Tu n'as encore rien vu","de ce dont je suis capable."],
 'n2':["Dans le prochain épisode...","Les formes de Litcheezer !"]}
for k,v in tl['voices'].items():
    n=V[k]['frames']; v['end']=v['start']+n
    assert v['end']<=limit[k], (k, v['end'], limit[k])
    cuts=V[k].get('cuts',[])
    v['cuts']=[v['start']+c for c in cuts]
    if k not in chunks: v['subs']=[]; print(k,v['start'],v['end']); continue
    if cuts and len(cuts)==len(chunks[k])-1:
        bounds=[v['start']]+[v['start']+c for c in cuts]+[v['end']]
        v['subs']=[{'text':c,'from':bounds[i],'to':bounds[i+1]} for i,c in enumerate(chunks[k]) if c]
    else:
        v['subs']=[{'text':chunks[k][0],'from':v['start'],'to':v['end']}]
    print(k,v['start'],v['end'],[s['from'] for s in v['subs']])
json.dump(tl,open(S+'/fbz/src/timeline5.json','w'),indent=1)
