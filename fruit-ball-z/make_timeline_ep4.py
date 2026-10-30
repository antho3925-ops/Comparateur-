"""Timing des plans et des répliques de l'ép.4 -> fbz/src/timeline4.json (à partir de voices4.json)."""
import json,sys
S=sys.argv[1]; V=json.load(open(S+'/fbz/src/voices4.json'))
tl={'total':2190,
 # carton, rappel ép.3, 5 scènes, « À suivre », teaser
 'scenes':{'open':[0,60],'recap':[60,240],'s1':[240,540],'s2':[540,940],'s3':[940,1290],'s4':[1290,1590],
           's5':[1590,1890],'suivre':[1890,1980],'teaser':[1980,2190]},
 'shadow':[290,400],'tiltUp':380,'shipLand':465,'march':[478,535],
 's2shots':[540,590,743,909],
 'fingerUp':1125,'flash':1165,'ruins':1185,
 'vegClose':1345,'fists':1510,
 's5shots':[1590,1650,1745],'fade':[1858,1890],
 'teaserShots':[1980,2045,2110],
 'voices':{'n1':{'start':64,'who':'nar'},'l1':{'start':600,'who':'ltz'},'l2':{'start':775,'who':'nam'},
           'l3':{'start':965,'who':'ltz'},'l4':{'start':1388,'who':'veg'},'n2':{'start':1662,'who':'nar'},
           'n3':{'start':1905,'who':'nar'},'n4':{'start':1992,'who':'nar'}}}
# la réplique doit finir avant ce repère
limit={'n1':240,'l1':743,'l2':909,'l3':1125,'l4':1510,'n2':1850,'n3':1975,'n4':2175}
# découpage des sous-titres en morceaux ('' = petit rire, la phrase précédente reste affichée)
chunks={'n1':["Précédemment dans Fruit Ball Z...","Kiwikolo et Petit-Poirsan ont atteint Namek... mais Végénade arrive, lui aussi !"],
 'l1':["Soyez raisonnables...","","donnez-moi simplement ce que je veux."],
 'l2':["Jamais.","Ces boules ne sont pas faites pour des mains comme les tiennes."],
 'l3':["Quel dommage.","","J'aurais tellement préféré faire ça dans le calme."],
 'l4':["Ce monstre...","il va tous nous détruire si personne ne l'arrête."],
 'n2':["Et alors qu'un espoir semblait s'éteindre...","un nouveau venu approchait."],
 'n3':["À suivre..."],
 'n4':["Dans le prochain épisode...","Pomgoku débarque !"]}
for k,v in tl['voices'].items():
    n=V[k]['frames']; v['end']=v['start']+n
    assert v['end']<=limit[k], (k, v['end'], limit[k])
    cuts=V[k].get('cuts',[])
    if cuts and len(cuts)==len(chunks[k])-1:
        bounds=[v['start']]+[v['start']+c for c in cuts]+[v['end']]
        subs=[]
        for i,c in enumerate(chunks[k]):
            if c: subs.append({'text':c,'from':bounds[i],'to':bounds[i+1]})
            else: subs[-1]['to']=bounds[i+1]
        v['subs']=subs
    else:
        v['subs']=[{'text':chunks[k][0],'from':v['start'],'to':v['end']}]
    print(k,v['start'],v['end'],[s['from'] for s in v['subs']])
json.dump(tl,open(S+'/fbz/src/timeline4.json','w'),indent=1)
