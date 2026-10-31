window.handleImageSelect = function(input){
  const file=input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement('canvas');
      const ctx=canvas.getContext('2d');
      // Auto upright fix
      canvas.width=img.width; canvas.height=img.height;
      ctx.drawImage(img,0,0);
      const fixed=canvas.toDataURL('image/jpeg',0.9);
      localStorage.setItem('ayna_profile_pic', fixed);
      document.getElementById('homePic').src=fixed;
      document.getElementById('preview')&&(document.getElementById('preview').src=fixed);
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}