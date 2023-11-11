const {getAlquiler,Alquiler} = require('../models/alquiler.js');
const {defined} = require("nunjucks/src/tests");
const express = require("express");



exports.puedeCalificar = async(usuario,producto) => {
    try {
        if(!defined(usuario)) return false;
        const alquiler = await getAlquiler(usuario,producto);
        return (alquiler && alquiler.id && alquiler.calificacion === null) ? alquiler.id : false;
    } catch (error) {
        return error
    }
}

exports.calificar= async(alquilerid,calificacion) =>{

    try {
        let alquiler = await Alquiler.findByPk(alquilerid);
        alquiler.calificacion = calificacion;
        await alquiler.save();
        return 200;
    }catch (e){
        return e;
    }
}





