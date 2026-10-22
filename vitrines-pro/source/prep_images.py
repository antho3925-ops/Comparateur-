import os, json, cv2, numpy as np
from PIL import Image
from ids import path
OUT='img'; os.makedirs(OUT,exist_ok=True)
OPS={
 16:{'inp':[[873,405,1078,483],[1325,430,1390,495]]},
 18:{'crop':[0,246,345,640]},
 23:{'inp':[[246,250,304,304]]},
 24:{'inp':[[386,94,497,116]]},
 30:{'crop':[0,0,588,360]},
 31:{'inp':[[100,0,215,58]]},
 32:{'inp':[[95,153,255,184]]},
 43:{'inp':[[55,145,130,215]]},
 48:{'inp':[[172,76,372,105]]},
 59:{'inp':[[291,215,482,267]],'crop':[24,113,545,505]},
 60:{'blur':[[50,165,106,190],[508,276,562,298]]},
 63:{'inp':[[28,52,84,86],[482,38,505,72]]},
 64:{'blur':[[245,172,345,425]]},
 67:{'inp':[[335,580,452,650]],'crop':[90,85,452,640]},
 71:{'inp':[[190,80,355,122]]},
 80:{'blur':[[338,240,400,264]]},
 83:{'inp':[[282,258,456,290],[542,284,572,308]],'blur':[[165,330,225,385]]},
 87:{'inp':[[168,142,208,192]]},
 88:{'inp':[[122,28,222,76]]},
 89:{'crop':[0,72,348,341]},
 92:{'inp':[[60,128,355,170]]},
 93:{'crop':[0,14,299,168]},
 102:{'crop':[0,0,335,342]},
 112:{'inp':[[120,80,280,140]]},
 114:{'inp':[[125,68,352,176],[392,125,452,205]]},
 117:{'inp':[[48,118,278,180],[300,130,420,188],[150,440,228,528]]},
 123:{'inp':[[205,38,405,92],[255,136,380,172]]},
 124:{'crop':[0,0,588,362]},
}
# extra derived images: before/after of the garage car (62)
USE=[i for i in range(1,128) if i not in (44,53,76,79,91,94,95,99,102,106,107,108,113)]
def apply(arr,op):
    for b in op.get('inp',[]):
        x0,y0,x1,y1=b; m=np.zeros(arr.shape[:2],np.uint8); m[y0:y1,x0:x1]=255
        arr=cv2.inpaint(arr,m,6,cv2.INPAINT_TELEA)
    for b in op.get('blur',[]):
        x0,y0,x1,y1=b; reg=arr[y0:y1,x0:x1]; arr[y0:y1,x0:x1]=cv2.GaussianBlur(reg,(0,0),9 if (x1-x0)<80 else 14)
    return arr
def save(im,name,maxw):
    w,h=im.size
    if max(w,h)>maxw:
        s=maxw/max(w,h); im=im.resize((int(w*s),int(h*s)),Image.LANCZOS)
    im.save(f'{OUT}/{name}.webp','WEBP',quality=76,method=6)
    return im.size
meta={}
for i in USE:
    im=Image.open(path(i)).convert('RGB')
    arr=cv2.cvtColor(np.array(im),cv2.COLOR_RGB2BGR)
    op=OPS.get(i,{})
    arr=apply(arr,op)
    im=Image.fromarray(cv2.cvtColor(arr,cv2.COLOR_BGR2RGB))
    if 'crop' in op: im=im.crop(tuple(op['crop']))
    maxw=1100 if i in (5,16,36,25,49,126) else 900
    if i in (1,2,3,4,6,109,110): maxw=1000
    meta[str(i)]=save(im,str(i),maxw)
json.dump(meta,open('img_meta.json','w'))
tot=sum(os.path.getsize(f'{OUT}/{f}') for f in os.listdir(OUT))
print(len(os.listdir(OUT)),'images',tot//1024,'KB')
