/*
  inSubnet - By Louis T. <louist@ltdev.im>
  Check an IP(v4 or v6) against a subnet.
*/
Exporter(function (isNode) {
   var proto = {
       version: '0.0.1',
       Auto: function (ip, subnet, mask) {
             if (!ip || !subnet) {
                return false;
             };
             var sm = this.getMask(subnet,mask),
                 subnet = sm[0], 
                 mask = sm[1];
             if (mask && !isNaN(mask)) {
                if (this.isIPv4(ip) && this.isIPv4(subnet)) {
                   return this.IPv4(ip,subnet,mask);
                } else if (this.isIPv6(ip) && this.isIPv6(subnet)) {
                   return this.IPv6(ip,subnet,mask);
                };
             };
             return false;
       },
       IPv4: function (ip, subnet, mask) {
             var sm = this.getMask(subnet,mask),
                 subnet = sm[0], 
                 mask = sm[1];
             if (this.isIPv4(ip) && this.isIPv4(subnet) && (mask && !isNaN(mask))) {
                return ((this.toInt(ip)&-1<<(32-mask)) == this.toInt(subnet));
             };
             return false;
       },
       isIPv4: function (ip) {
             return /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}$/.test(ip);
       },
       IPv6: function (ip, subnet, mask) {
             var sm = this.getMask(subnet,mask),
                 subnet = sm[0],
                 mask = sm[1];
             if (this.isIPv6(ip) && this.isIPv6(subnet) && (mask && !isNaN(mask))) {
                var o = Array.apply(null,Array(Math.floor(mask/16))).map(function(_){ return 0xffff; });
                if (mask%16) {
                   o.push((1<<mask%16)-1);
                };
                var mask = o.concat(Array.apply(null,Array(8-o.length)).map(function(_){ return 0; }));     
                ip = this.toInt(ip,6), subnet = this.toInt(subnet,6);
                return mask.every(function(m,n){ return (ip[n]&m) == (subnet[n]&m) });
             };
             return false;
       },
       isIPv6: function (ip) {
             return this.__isIPv6(this.expand(ip));
       },
       __isIPv6: function (ip) {
             return /^([0-9a-f]{4}|0)(\:([0-9a-f]{4}|0)){7}$/i.test(ip);
       },
       isIP: function (ip) {
             return (this.isIPv4(ip)||this.isIPv6(ip));
       },
       getMask: function (subnet, mask) {
             if (subnet && subnet.indexOf('/') != -1) {
                try {
                   var split = subnet.split('/');
                       subnet = split[0],
                       mask = split[1];
                } catch (e) { }; // Handle the error!?
             };
             return [subnet,mask];
       },
       toInt: function (ip,mode) {
             switch (mode) {
                    case 6:
                         return this.expand(ip).split(":").map(function(x){return parseInt(x,16)});
                    case 4:
                    default:
                         return ((ip=ip.split('.'))[0]<<24|ip[1]<<16|ip[2]<<8|ip[3]);
             };
       },
       expand: function (ip) {
             var ip = String(ip);
             if (ip.indexOf("::") != -1) {
                if (ip.match(/::/g).length > 1) {
                   return false;
                };
                var split = ip.split("::"),
                    res = (split[0]+Array(9-(split[0].split(":").length+split[1].split(":").length)).join(':0000')+':'+split[1]).split(":");
             };
             var ip = (res||ip.split(":")).map(function (x) {
                 return (x.length<4?(new Array(5-x.length).join('0')+x):x);
             }).join(":");
             return (this.__isIPv6(ip)?ip:false);
       },
   };
   return Object.create(proto);
},"inSubnet");

/*
  Need to make this better. Should check more than just 
  exports and window as that can be set by anything.
*/
function Exporter (fn,plug) {
         if (typeof exports === 'undefined' && window) {
            window[plug] = fn(false);
          } else {
            module.exports = fn(true);
         };
};
