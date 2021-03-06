const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange
} = require('@adiwajshing/baileys')
const { color, bgcolor } = require('./lib/color')
const { wait, simih, getBuffer, h2k, generateMessageID, getGroupAdmins, getRandom, banner, start, info, success, close } = require('./lib/functions')
const { fetchJson, fetchText } = require('./lib/fetcher')
const { recognize } = require('./lib/ocr')
const fs = require('fs')
const moment = require('moment-timezone')
const { exec } = require('child_process')
const fetch = require('node-fetch')
const tiktod = require('tiktok-scraper')
const ffmpeg = require('fluent-ffmpeg')
const { removeBackgroundFromImageFile } = require('remove.bg')
const setting = JSON.parse(fs.readFileSync('./src/settings.json'))
prefix = setting.prefix
blocked = []

function kyun(seconds){
  function pad(s){
    return (s < 10 ? '0' : '') + s;
  }
  var hours = Math.floor(seconds / (60*60));
  var minutes = Math.floor(seconds % (60*60) / 60);
  var seconds = Math.floor(seconds % 60);

  //return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
  return `${pad(hours)}J ${pad(minutes)}M ${pad(seconds)}D`
}

async function starts() {
	const client = new WAConnection()
	client.logger.level = 'warn'
	console.log(banner.string)
	client.on('qr', () => {
		console.log(color('[','white'), color('!','red'), color(']','white'), color(' Scan the qr code above'))
	})

	fs.existsSync('./self-bot.json') && client.loadAuthInfo('./self-bot.json')
	client.on('connecting', () => {
		start('2', 'Connecting...')
	})
	client.on('open', () => {
		success('2', 'Connected')
	})
	await client.connect({timeoutMs: 30*1000})
        fs.writeFileSync('./self-bot.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))

	client.on('CB:Blocklist', json => {
            if (blocked.length > 2) return
	    for (let i of json[1].blocklist) {
	    	blocked.push(i.replace('c.us','s.whatsapp.net'))
	    }
	})

	client.on('chat-update', async (mek) => {
		try {
            if (!mek.hasNewMessage) return
            mek = mek.messages.all()[0]
			if (!mek.message) return
			if (mek.key && mek.key.remoteJid == 'status@broadcast') return
			if (!mek.key.fromMe) return
			global.prefix
			global.blocked
			const content = JSON.stringify(mek.message)
			const from = mek.key.remoteJid
			const type = Object.keys(mek.message)[0]
			const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType
			const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
			body = (type === 'conversation' && mek.message.conversation.startsWith(prefix)) ? mek.message.conversation : (type == 'imageMessage') && mek.message.imageMessage.caption.startsWith(prefix) ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption.startsWith(prefix) ? mek.message.videoMessage.caption : (type == 'extendedTextMessage') && mek.message.extendedTextMessage.text.startsWith(prefix) ? mek.message.extendedTextMessage.text : ''
			budy = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : ''
			const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
			const args = body.trim().split(/ +/).slice(1)
			const isCmd = body.startsWith(prefix)

			const botNumber = client.user.jid
			const ownerNumber = [`${setting.ownerNumber}@s.whatsapp.net`] // replace this with your number
			const isGroup = from.endsWith('@g.us')
			const sender = isGroup ? mek.participant : mek.key.remoteJid
			const groupMetadata = isGroup ? await client.groupMetadata(from) : ''
			const groupName = isGroup ? groupMetadata.subject : ''
			const groupId = isGroup ? groupMetadata.jid : ''
			const groupMembers = isGroup ? groupMetadata.participants : ''
			const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
			const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
			const isGroupAdmins = groupAdmins.includes(sender) || false
			const isOwner = ownerNumber.includes(sender)
			const isUrl = (url) => {
			    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
			}
			const reply = (teks) => {
				client.sendMessage(from, teks, text, {quoted:mek})
			}
			const apikey = setting.apiKey // get on https://leyscoders-api.herokuapp.com
			const sendMess = (hehe, teks) => {
				client.sendMessage(hehe, teks, text)
			}
			const freply = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: from } : {}) }, message: { conversation: `𝗦𝗲𝗹𝗳𝗕𝗼𝘁 𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽` }}
			
			const mentions = (teks, memberr, id) => {
				(id == null || id == undefined || id == false) ? client.sendMessage(from, teks.trim(), extendedText, {contextInfo: {"mentionedJid": memberr}}) : client.sendMessage(from, teks.trim(), extendedText, {quoted: mek, contextInfo: {"mentionedJid": memberr}})
			}

			colors = ['red','white','black','blue','yellow','green']
			const isMedia = (type === 'imageMessage' || type === 'videoMessage')
			const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
			const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
			const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
			if (!isGroup && isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
			if (isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
			let authorname = client.contacts[from] != undefined ? client.contacts[from].vname || client.contacts[from].notify : undefined	
			if (authorname != undefined) { } else { authorname = groupName }	
			
			switch(command) {
				case 'help':
				case 'menu':
runtime = process.uptime()
	client.sendMessage(from, `
◪ 𝗜𝗡𝗙𝗢
  ❏ Runtime: ${kyun(runtime)}
  ❏ Prefix: 「  ${prefix} 」
  ❏ Selfbot Whatsapp
  
◪ 𝗠𝗘𝗡𝗨
- ${prefix}sticker
- ${prefix}kali [2|8]
- ${prefix}persegipjg [lebar|panjang]
- ${prefix}kuadrat [angka]
- ${prefix}persegi [sisi]
- ${prefix}kubik [angka]
- ${prefix}detik
- ${prefix}sindointer
- ${prefix}sindonasional
- ${prefix}okezone
- ${prefix}antara
- ${prefix}berita
- ${prefix}kiryuu`, MessageType.text, {quoted: freply})
			break
				case 'kubik':
					data = await fetchJson(`https://leyscoders-api.herokuapp.com/api/bdr/kubik?q=${body.slice(7)}&apikey=freeKeY`)
					reply(`hasil: ${data.result}`)
					break
				case 'sindointer':
					datas = await fetchJson(`https://leyscoders-api.herokuapp.com/api/sindo/international?apikey=${apikey}`)
					teks = '=================\n'
					for (let i of datas.data) {
						teks += `\n*Judul* : ${i.judul}\n*Link* : ${i.link}\n*Waktu:* ${i.waktu}\n*Type:* ${i.tipe}\n*Desc*: ${i.kutipan}\n=================\n`
					}
					client.sendMessage(from, teks, MessageType.text, {quoted: freply})
					break
				case 'sindonasional':
					datas = await fetchJson(`https://leyscoders-api.herokuapp.com/api/sindo/nasional?apikey=${apikey}`)
					teks = '=================\n'
					for (let i of datas.data) {
						teks += `\n*Judul* : ${i.judul}\n*Link* : ${i.link}\n*Waktu:* ${i.waktu}\n*Type:* ${i.tipe}\n*Desc*: ${i.kutipan}\n=================\n`
					}
					client.sendMessage(from, teks, MessageType.text, {quoted: freply})
					break
				case 'kiryuu':
					data = await fetchJson(`https://leyscoders-api.herokuapp.com/api/kiryuu?apikey=${apikey}`)
					teks = '=================\n'
					for (let i of data.result) {
						teks += `\n*Link:* ${i.url}\n*Judul:* ${i.judul}\n=================\n`
					}
					client.sendMessage(from, teks, MessageType.text, {quoted: freply})
					break
				case 'berita':
					datas = await fetchJson(`https://leyscoders-api.herokuapp.com/api/berita-news?apikey=${apikey}`)
					teks = '=================\n'
					for (let i of datas.result) {
						teks += `\n*Judul* : ${i.title}\n*Link* : ${i.url}\n=================\n`
					}
					buffs = await getBuffer(`${datas.result[0].img}`)
					client.sendMessage(from, buffs, MessageType.image, {quoted: freply, caption: teks})
					break
				case 'antara':
					datas = await fetchJson(`https://leyscoders-api.herokuapp.com/api/antara-news?apikey=${apikey}`)
					teks = '=================\n'
					for (let i of datas.result) {
						teks += `\n*Judul* : ${i.title}\n*Link* : ${i.url}\n=================\n`
					}
					buffs = await getBuffer(`${datas.result[0].img}`)
					client.sendMessage(from, buffs, MessageType.image, {quoted: freply, caption: teks})
					break
				case 'okezone':
					data = await fetchJson(`https://leyscoders-api.herokuapp.com/api/okezone?apikey=${apikey}`)
					teks = '=================\n'
					for (let i of data.result) {
						teks += `\n*Judul* : ${i.title}\n*Link* : ${i.url}\n=================\n`
					}
					client.sendMessage(from, teks, MessageType.text, {quoted: freply})
					break
				case 'detik':
					data = await fetchJson(`https://leyscoders-api.herokuapp.com/api/detik?apikey=${apikey}`)
					teks = '=================\n'
					for (let i of data.result) {
						teks += `\n*Judul* : ${i.title}\n*Link* : ${i.url}\n=================\n`
					}
					client.sendMessage(from, teks, MessageType.text, {quoted: freply})
					break
				case 'kuadrat':
					data = await fetchJson(`https://leyscoders-api.herokuapp.com/api/bdr/kuadrat?q=${body.slice(9)}&apikey=${apikey}`)
					reply(`hasil: ${data.result}`)
					break
				case 'persegi':
					splet = body.slice(9)
                                        data = await fetchJson(`https://leyscoders-api.herokuapp.com/api/persegi?sisi=${splet}apikey=${apikey}`)
                                       client.sendMessage(from, `Keliling:\nRumus: ${data.rumus_keliling}\nhasil: ${data.hasil_keliling}\n\nLuas:\nRumus: ${data.rumus_luas}\nHasil: ${data.hsail_luas}`, MessageType.text, {quoted: mek})
                                       break
				case 'persegipjg':
					splet = body.slice(12)
                                        no1 = splet.split('|')[0];
                                        no2 = splet.split('|')[1];
                                        data = await fetchJson(`https://leyscoders-api.herokuapp.com/api/ppanjang?pjg=${no2}&lebar=${no2}&apikey=${apikey}`)
                                       client.sendMessage(from, `Keliling:\nRumus: ${data.rumus_keliling}\nhasil: ${data.hasil_keliling}\n\nLuas:\nRumus: ${data.rumus_luas}\nHasil: ${data.hsail_luas}`, MessageType.text, {quoted: mek})
                                       break
                               case 'kali':
                               	splet = body.slice(6)
                                        no1 = splet.split('|')[0];
                                        no2 = splet.split('|')[1];
                                        data = await fetchJson(`https://leyscoders-api.herokuapp.com/api/perkalian?angka1=${no1}&angka2=${no2}&apikey=${apikey}`)
                                        reply(`Hasil: ${data.result}`)
                                        break
				case 'stiker': 
				case 'sticker':
					if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						ran = getRandom('.webp')
						await ffmpeg(`./${media}`)
							.input(media)
							.on('start', function (cmd) {
								console.log(`Started : ${cmd}`)
							})
							.on('error', function (err) {
								console.log(`Error : ${err}`)
								fs.unlinkSync(media)
								reply(mess.error.stick)
							})
							.on('end', function () {
								console.log('Finish')
								buff = fs.readFileSync(ran)
								client.sendMessage(from, buff, sticker, {quoted: mek})
								fs.unlinkSync(media)
								fs.unlinkSync(ran)
							})
							.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
							.toFormat('webp')
							.save(ran)
					} else if ((isMedia && mek.message.videoMessage.seconds < 11 || isQuotedVideo && mek.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11) && args.length == 0) {
						const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						ran = getRandom('.webp')
						reply(mess.wait)
						await ffmpeg(`./${media}`)
							.inputFormat(media.split('.')[1])
							.on('start', function (cmd) {
								console.log(`Started : ${cmd}`)
							})
							.on('error', function (err) {
								console.log(`Error : ${err}`)
								fs.unlinkSync(media)
								tipe = media.endsWith('.mp4') ? 'video' : 'gif'
								reply(`Yah error dek`)
							})
							.on('end', function () {
								console.log('Finish')
								buff = fs.readFileSync(ran)
								client.sendMessage(from, buff, sticker, {quoted: mek})
								fs.unlinkSync(media)
								fs.unlinkSync(ran)
							})
							.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
							.toFormat('webp')
							.save(ran)
					} else if ((isMedia || isQuotedImage) && args[0] == 'nobg') {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						ranw = getRandom('.webp')
						ranp = getRandom('.png')
						reply(mess.wait)
						keyrmbg = 'Your-ApiKey'
						await removeBackgroundFromImageFile({path: media, apiKey: keyrmbg.result, size: 'auto', type: 'auto', ranp}).then(res => {
							fs.unlinkSync(media)
							let buffer = Buffer.from(res.base64img, 'base64')
							fs.writeFileSync(ranp, buffer, (err) => {
								if (err) return reply('Yah error dek')
							})
							exec(`ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${ranw}`, (err) => {
								fs.unlinkSync(ranp)
								if (err) return reply(mess.error.stick)
								buff = fs.readFileSync(ranw)
								client.sendMessage(from, buff, sticker, {quoted: mek})
							})
						})					
					} else {
						reply(`𝗸𝗶𝗿𝗶𝗺 𝗴𝗮𝗺𝗯𝗮𝗿 𝗱𝗲𝗻𝗴𝗮𝗻 𝗰𝗮𝗽𝘁𝗶𝗼𝗻 ${prefix}𝘀𝘁𝗶𝗰𝗸𝗲𝗿 𝗮𝘁𝗮𝘂 𝗿𝗲𝗽𝗹𝘆/𝘁𝗮𝗴 𝗴𝗮𝗺𝗯𝗮𝗿`)
					}
					break
				case 'setprefix':
					if (args.length < 1) return
					if (!isOwner) return reply(mess.only.ownerB)
					prefix = args[0]
					setting.prefix = prefix
					fs.writeFileSync('./src/settings.json', JSON.stringify(setting, null, '\t'))
					reply(`Prefix berhasil di ubah menjadi : ${prefix}`)
					break
				
                           }
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})
}
starts()
//SC BY MHANKBARBAR
//RECODE BY HAFIZH
//CUMAN RECODE BANG
