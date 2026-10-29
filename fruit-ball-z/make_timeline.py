import json,sys
S=sys.argv[1]; V=json.load(open(S+'/fbz/src/voices.json'))
tl={'total':1170,'scenes':{'s1':[0,180],'s2':[180,330],'s3':[330,540],'s4':[540,840],'s5':[840,1035]},
 'crash':272,'grab':600,'fly':612,'freeze':990,'title':1035,
 'hops':[10,40,70,100,130,160],'steps':[392,412,432],
 'voices':{'l1':{'start':38,'who':'pom'},'l2':{'start':418,'who':'rad'},'l3':{'start':626,'who':'pom'},
           'l4':{'start':700,'who':'rad'},'l5':{'start':880,'who':'pom'}}}
# découpage des sous-titres en morceaux
chunks={'l1':["Encore une pomme bien juteuse aujourd'hui,","hein Petit-Poirsan !"],
 'l2':["Tu ne sais même pas ce que tu es vraiment...","Pathétique."],
 'l3':["Rends-moi mon fils tout de suite !"],
 'l4':["Deviens plus fort, petit frère...","Ou regarde-le disparaître."],
 'l5':["Je te jure...","que je vais te faire payer ça."]}
for k,v in tl['voices'].items():
    n=V[k]['frames']; v['end']=v['start']+n
    assert v['end']<=tl['scenes']['s'+str({'l1':1,'l2':3,'l3':4,'l4':4,'l5':5}[k])][1], k
    # répartition proportionnelle à la longueur du texte
    tot=sum(len(c) for c in chunks[k]); acc=0; subs=[]
    cuts=V[k].get('cuts',[])
    if cuts and len(cuts)==len(chunks[k])-1:
        bounds=[v['start']]+[v['start']+c for c in cuts]+[v['end']]
        v['subs']=[{'text':c,'from':bounds[i],'to':bounds[i+1]} for i,c in enumerate(chunks[k])]
        print(k,v['start'],v['end'],bounds); continue
    for c in chunks[k]:
        a=v['start']+round(n*acc/tot); acc+=len(c); b=v['start']+round(n*acc/tot)
        subs.append({'text':c,'from':a,'to':b})
    v['subs']=subs
    print(k,v['start'],v['end'])
json.dump(tl,open(S+'/fbz/src/timeline.json','w'),indent=1)
