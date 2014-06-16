if (typeof require !== 'undefined') {
    // node.js adaptation
    var mpegts = require('./ts.js');
}

// ---------- PES Packet class ----------

mpegts.pes.PesPacket = function(){
	this.m_cStreamID					= null;            
	this.m_nPESPacketLength				= null;        
	this.m_cPESScramblingCtrl			= null;
	this.m_bPESpriority					= null;
	this.m_bDataAlignement				= null;
	this.m_bCopyright					= null;
	this.m_bOriginalOrCopy				= null;
	this.m_cPES_header_data_length		= null;
	this.m_cPTS_DTS_flags				= null;
	this.m_bESCR_flag					= null;
	this.m_bES_rate_flag				= null;
	this.m_bDSM_trick_mode_flag			= null;
	this.m_bAdditional_copy_info_flag	= null;
	this.m_bPES_CRC_flag				= null;
	this.m_bPES_extension_flag			= null;
	this.m_pPTS							= null;
	this.m_pDTS							= null;
	this.m_pESCR						= null;
	this.m_ES_rate						= null;
	this.m_DSM_trick_mode				= null;
	this.m_Additional_copy_info			= null;
	this.m_PES_CRC						= null;
	this.m_cNbStuffingBytes				= null;
	this.m_pPESExtension				= null;
	this.m_pPrivateData					= null;
	this.m_IdPayload					= null;
	this.m_nPayloadLength				= null;
	this.m_bDirty						= null;
	this.m_bValid						= false;
};

mpegts.pes.PesPacket.prototype.parse = function(data) {
	var index = 0;
	this.m_nLength = data.length;
	// packet_start_code_prefix
	var nStartCode = mpegts.binary.getValueFrom3Bytes(data.subarray(index, index+3));
	if (nStartCode !== this.START_CODE_PREFIX)
	{
		console.log("PES Packet start code not define!");
		return;
	}

	index = 3; // 3 = packet_start_code_prefix length

	// stream_id
	this.m_cStreamID	= data[index];
	index++;

	// PES_packet_length
	this.m_nPESPacketLength = mpegts.binary.getValueFrom2Bytes(data.subarray(index,index+2));
	index += 2;
	
	// Padding bytes
	if (this.m_cStreamID === mpegts.ts.TsPacket.prototype.STREAM_ID_PADDING_STREAM)
	{
		// Padding bytes => no more field, no payload
		this.m_bValid = true;
		return;
	}

	// PES_packet_data_byte (no optional header)
	if (!this.hasOptionalPESHeader()) {
		//NAN => to Validate!!!!
		// no more header field, only payload
		this.m_IdPayload = index + mpegts.pes.PesPacket.prototype.FIXED_HEADER_LENGTH;
		this.m_nPayloadLength = this.m_nLength - mpegts.pes.PesPacket.prototype.FIXED_HEADER_LENGTH;
		this.m_bValid = true;
		return;
	}

	// Optional PES header
	var reserved = mpegts.binary.getValueFromByte(data[index], 0, 2);
	if (reserved != 0x02)
	{
		return;
	}
	this.m_cPESScramblingCtrl	= mpegts.binary.getValueFromByte(data[index], 2, 2);
	this.m_bPESpriority			= mpegts.binary.getBitFromByte(data[index], 4);
	this.m_bDataAlignement		= mpegts.binary.getBitFromByte(data[index], 5);
	this.m_bCopyright			= mpegts.binary.getBitFromByte(data[index], 6);
	this.m_bOriginalOrCopy		= mpegts.binary.getBitFromByte(data[index], 7);
	index++;

	// 7 flags
	this.m_cPTS_DTS_flags				= mpegts.binary.getValueFromByte(data[index], 0, 2);
	this.m_bESCR_flag					= mpegts.binary.getBitFromByte(data[index], 2);
	this.m_bES_rate_flag				= mpegts.binary.getBitFromByte(data[index], 3);
	this.m_bDSM_trick_mode_flag			= mpegts.binary.getBitFromByte(data[index], 4);
	this.m_bAdditional_copy_info_flag	= mpegts.binary.getBitFromByte(data[index], 5);
	this.m_bPES_CRC_flag				= mpegts.binary.getBitFromByte(data[index], 6);
	this.m_bPES_extension_flag			= mpegts.binary.getBitFromByte(data[index], 7);
	index++;

	// PES_header_data_length
	this.m_cPES_header_data_length = (data[index] & 0xFF);
	index++;
			
	// PTS
	if((this.m_cPTS_DTS_flags & mpegts.pes.PesPacket.prototype.FLAG_PTS) == mpegts.pes.PesPacket.prototype.FLAG_PTS)
	{
		this.m_pPTS = new mpegts.Pts(data.subarray(index, index+5));
		index += 5;
	}

	// DTS
	if((this.m_cPTS_DTS_flags & mpegts.pes.PesPacket.prototype.FLAG_DTS) == mpegts.pes.PesPacket.prototype.FLAG_DTS)
	{
		debugger;
		this.m_pDTS = new mpegts.Pts(data.subarray(index, index+5));
		index += 5;
	}

	// ESCR
	if(this.m_bESCR_flag)
	{
		//NAN => to Complete
		//this.m_pESCR = new PCR(m_pBytestream + index);
		index += 6;
	}

	// ES_rate	
	if(this.m_bES_rate_flag) {
		this.m_ES_rate = mpegts.binary.getValueFrom3Bytes(data.subarray(index, index+3), 1, 22);
		index += 3;
	}
	
	// DSM_trick_mode
	if(this.m_bDSM_trick_mode_flag)
	{
		this.m_DSM_trick_mode = data[index];
		index++;
	}

	// Additional_copy_info
	if(this.m_bAdditional_copy_info_flag)
	{
		this.m_Additional_copy_info = data[index];
		index++;
	}

	// PES_CRC
	if(this.m_bPES_CRC_flag)
	{
		this.m_PES_CRC = mpegts.binary.getValueFrom2Bytes(data.subarray(index, index+2));
		index += 2;
	}

	// PES_extension
	if(this.m_bPES_extension_flag)
	{
		//NAN => to Complete
		//this.m_pPESExtension = new PESExtension(m_pBytestream + index, m_cPES_header_data_length);
		//index += m_pPESExtension->getLength();
	}

	// Stuffing bytes
	var uiHeaderLength = mpegts.pes.PesPacket.prototype.FIXED_HEADER_LENGTH + mpegts.pes.PesPacket.prototype.FIXED_OPTIONAL_HEADER_LENGTH + this.m_cPES_header_data_length;
	this.m_cNbStuffingBytes = uiHeaderLength - index;
	index += this.m_cNbStuffingBytes;

	// Payload
	this.m_IdPayload = uiHeaderLength;
	this.m_nPayloadLength = this.m_nLength - uiHeaderLength;

	this.m_bValid = true;
};


/**
* Returns true if header contains optional PES header.
* @return true if header contains optional PES header
*/
mpegts.pes.PesPacket.prototype.hasOptionalPESHeader = function() {
	
	if ((this.m_cStreamID === mpegts.ts.TsPacket.prototype.STREAM_ID_PROGRAM_STREAM_MAP)		||
		(this.m_cStreamID === mpegts.ts.TsPacket.prototype.STREAM_ID_PADDING_STREAM)			||
		(this.m_cStreamID === mpegts.ts.TsPacket.prototype.STREAM_ID_PRIVATE_STREAM_2)			||
		(this.m_cStreamID === mpegts.ts.TsPacket.prototype.STREAM_ID_ECM_STREAM)				||
		(this.m_cStreamID === mpegts.ts.TsPacket.prototype.STREAM_ID_EMM_STREAM)				||
		(this.m_cStreamID === mpegts.ts.TsPacket.prototype.STREAM_ID_PROGRAM_STREAM_DIRECTORY)	||
		(this.m_cStreamID === mpegts.ts.TsPacket.prototype.STREAM_ID_DSMCC_STREAM)				||
		(this.m_cStreamID === mpegts.ts.TsPacket.prototype.STREAM_ID_H2221_TYPE_E_STREAM)) {
		return false;
	}

	return true;
};

mpegts.pes.PesPacket.prototype.getHeaderLength = function() {
    //return m_nPID;
};

mpegts.pes.PesPacket.prototype.getPTS = function() {
    //return m_nPID;
};

mpegts.pes.PesPacket.prototype.getDTS = function() {
    //return m_nPID;
};

/** The start code prefix */
mpegts.pes.PesPacket.prototype.START_CODE_PREFIX = 0x000001;
/** The first fixed header fields length (start_code + stream_id + PES_packet_length fields) **/
mpegts.pes.PesPacket.prototype.FIXED_HEADER_LENGTH = 6;
/** The first optional fixed header fields length **/
mpegts.pes.PesPacket.prototype.FIXED_OPTIONAL_HEADER_LENGTH = 3;
/** PTS_DTS_flags possible values */
mpegts.pes.PesPacket.prototype.FLAG_DTS = 0x01;
mpegts.pes.PesPacket.prototype.FLAG_PTS = 0x02;